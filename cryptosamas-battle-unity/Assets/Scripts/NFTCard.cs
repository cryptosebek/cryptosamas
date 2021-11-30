using UnityEngine;
using UnityEngine.UI;
using DG.Tweening;

[RequireComponent(typeof(FollowMouse))]
public class NFTCard : MonoBehaviour
{
    private FollowMouse _followMouseFX;
    
    private AudioSource _audioSource;

    [SerializeField]
    private GameObject _isPlayingHighlight;

    [SerializeField]
    private GameObject _arrowHighlight, _arrowHealingHighlight;

    [SerializeField]
    private Button _cardImage;

    [SerializeField]
    private Slider _healthbar;

    [SerializeField]
    private GameObject[] _hitParticles;

    private int _health = 100;

    public int Health => _health;

    void Awake()
    {
        _audioSource = GetComponent<AudioSource>();
        _followMouseFX = GetComponent<FollowMouse>();
        _arrowHighlight.GetComponent<RectTransform>().DOLocalMoveY(100f, 0.5f).SetEase(Ease.InOutSine).SetLoops(-1, LoopType.Yoyo);
        _arrowHealingHighlight.GetComponent<RectTransform>().DOLocalMoveY(100f, 0.5f).SetEase(Ease.InOutSine).SetLoops(-1, LoopType.Yoyo);
        SetIsPlaying(false);
        _cardImage.onClick.AddListener(()=>{
            if (BattleController.Instance) {
                BattleController.Instance.OnTargetChoosen(this);
            }
        });
    }

    public void SetIsPlaying(bool flag, bool followMouseFX = true)
    {
        if (followMouseFX) {
            _followMouseFX.enabled = flag;
        } else {
            _followMouseFX.enabled = false;
        }
        if (!_followMouseFX.enabled) {
            _followMouseFX.Reset();
        }
        _isPlayingHighlight.SetActive(flag);
        transform.localScale = Vector3.one * (flag ? 1.1f : 1f);
    }

    public void SetIsAttackable(bool flag)
    {
        _cardImage.interactable = flag;
        _arrowHighlight.SetActive(flag);
    }

    public void SetIsHealable(bool flag)
    {
        _cardImage.interactable = flag;
        _arrowHealingHighlight.SetActive(flag);
    }

    public void Heal()
    {
        _health = Mathf.Clamp(_health + 25, 0, 100);
        _healthbar.value = Mathf.InverseLerp(0, 100, _health);

        transform.DOPunchScale(Vector3.one * 0.4f, 0.25f, 5, 1);
    }

    public void Hit(int skillID)
    {
        _audioSource.Play();
        
        transform.DOPunchScale(Vector3.one * 0.4f, 0.25f, 5, 1);

        var fx = Instantiate(_hitParticles[skillID], transform.position - new Vector3(0,0,1f), Quaternion.identity);
        Destroy(fx, 3f);

        int skillDamage = 10;
        if (skillID == 1) {
            skillDamage = 25;
        } else if (skillID == 2) {
            skillDamage = 50;
        }
        _health = Mathf.Clamp(_health - skillDamage, 0, 100);
        _healthbar.value = Mathf.InverseLerp(0, 100, _health);

        if (_health <= 0) {
            var canv = GetComponent<CanvasGroup>();
            canv.alpha = 0.5f;
            canv.interactable = false;
        }
    }
}
