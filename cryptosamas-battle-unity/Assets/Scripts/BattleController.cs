using System.Collections;
using System.Collections.Generic;
using DG.Tweening;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class BattleController : MonoBehaviour
{
    public static BattleController Instance;
    private void Awake() { Instance = this; }
    private void OnDestroy() { Instance = null; }

    [SerializeField]
    private Transform _npcCardsRoot, _playerCardsRoot;

    [SerializeField]
    private SkillButton[] _skillsButtons;

    [SerializeField]
    private TextMeshProUGUI _msgLabel;

    private NFTCard[] _npcCards, _playerCards;

    private int _npcCurrentCardIndex = -1, _playerCurrentCardIndex = -1;

    private bool _isPlayerTurn = false;

    private int _lastSkillID;

    void Start()
    {
        _npcCards = _npcCardsRoot.GetComponentsInChildren<NFTCard>(true);
        _playerCards = _playerCardsRoot.GetComponentsInChildren<NFTCard>(true);

        OnNextTurn();
    }

    private void OnGameEnd(bool isPlayerWon)
    {
        foreach(var b in _skillsButtons) {
            b.Disable();
        }
        for(var i=0; i<_npcCards.Length; i++) {
            _npcCards[i].SetIsPlaying(false);
        }
        for(var i=0; i<_playerCards.Length; i++) {
            _playerCards[i].SetIsPlaying(false);
        }
        _msgLabel.text = isPlayerWon ? "You won!" : "You lose!";
        _msgLabel.transform.DOScale(Vector3.one, 0.8f).SetEase(Ease.OutBack).OnComplete(()=>{
            DOVirtual.DelayedCall(0.4f, ()=> {
                _msgLabel.transform.DOScale(Vector3.zero, 1f).SetEase(Ease.InBack);
            });
        });
    }

    IEnumerator SimulateBasicAI()
    {
        yield return new WaitForSeconds(Random.Range(0.6f, 1.2f));
        NFTCard chosenCard = null;
        do {
            chosenCard = _playerCards[Random.Range(0, _playerCards.Length)];
        } while(chosenCard.Health <= 0);
        StartCoroutine(HitCard(chosenCard, 0));
    }

    private void OnNextTurn()
    {
        _isPlayerTurn = !_isPlayerTurn;

        if (_isPlayerTurn) {
            var isPlayerAlive = false;
            for(var i=0; i<_playerCards.Length; i++) {
                if (_playerCards[i].Health > 0 ) {
                    isPlayerAlive = true;
                    break;
                }
            }
            if (isPlayerAlive) {
                do
                {
                    _playerCurrentCardIndex++;
                    if (_playerCurrentCardIndex > _playerCards.Length - 1) {
                        _playerCurrentCardIndex = 0;
                    }
                } while(_playerCards[_playerCurrentCardIndex].Health <= 0);
                for(var i=0; i<_npcCards.Length; i++) {
                    _npcCards[i].SetIsPlaying(false);
                }
                for(var i=0; i<_playerCards.Length; i++) {
                    _playerCards[i].SetIsPlaying(_playerCurrentCardIndex == i);
                }
            } else {
                OnGameEnd(false);
            }
        } else {
            var isNPCalive = false;
            for(var i=0; i<_npcCards.Length; i++) {
                if (_npcCards[i].Health > 0 ) {
                    isNPCalive = true;
                    break;
                }
            }
            if (isNPCalive) {
                do
                {
                    _npcCurrentCardIndex++;
                    if (_npcCurrentCardIndex > _npcCards.Length - 1) {
                        _npcCurrentCardIndex = 0;
                    }
                } while (_npcCards[_npcCurrentCardIndex].Health <= 0);
                for(var i=0; i<_playerCards.Length; i++) {
                    _playerCards[i].SetIsPlaying(false);
                    _npcCards[i].SetIsAttackable(false);
                    // _playerCards[i].SetIsAttackable(true);
                }
                for(var i=0; i<_npcCards.Length; i++) {
                    _npcCards[i].SetIsPlaying(_npcCurrentCardIndex == i, false);
                }
                StartCoroutine(SimulateBasicAI());
            } else {
                OnGameEnd(true);
            }
        }

        foreach(var b in _skillsButtons) {
            b.SetIsInteractable(_isPlayerTurn);
        }
    }

    public void OnSkillButtonClick(int skillID)
    {
        if (!_isPlayerTurn) {
            return;
        }

        _lastSkillID = skillID;

        if (skillID == 1) {
            for(var i=0; i<_npcCards.Length; i++) {
                _npcCards[i].SetIsPlaying(false);
            }
            for(var i=0; i<_playerCards.Length; i++) {
                _playerCards[i].SetIsHealable(true);
            }
        } else {
            for(var i=0; i<_npcCards.Length; i++) {
                _npcCards[i].SetIsPlaying(false);
                if (_npcCards[i].Health > 0) {
                    _npcCards[i].SetIsAttackable(true);
                }
            }
        }

        foreach(var b in _skillsButtons) {
            b.SetIsInteractable(false);
        }
    }

    public void OnTargetChoosen(NFTCard target)
    {
        if (_isPlayerTurn && _lastSkillID == 1) {
            for(var i=0; i<_playerCards.Length; i++) {
                _playerCards[i].SetIsHealable(false);
            }
            StartCoroutine(Heal(target));
            return;
        }

        for(var i=0; i<_npcCards.Length; i++) {
            _npcCards[i].SetIsAttackable(false);
        }

        StartCoroutine(HitCard(target, _lastSkillID));
    }

    IEnumerator Heal(NFTCard target)
    {
        target.Heal();
        yield return new WaitForSeconds(1f);
        OnNextTurn();
    }

    IEnumerator HitCard(NFTCard target, int skillID)
    {
        if (skillID == 2)
        {
            for(var i=0; i<_npcCards.Length; i++) {
                if (_npcCards[i].Health > 0) {
                    _npcCards[i].Hit(skillID);
                }
            }
        }
        else
        {
            target.Hit(skillID);
        }
        yield return new WaitForSeconds(1f);
        OnNextTurn();
    }
}
