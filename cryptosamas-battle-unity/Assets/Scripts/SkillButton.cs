using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(Button))]
public class SkillButton : MonoBehaviour
{
    [SerializeField]
    private GameObject _highlight;

    [SerializeField]
    private int _skillId;

    [SerializeField]
    private int _cooldown;

    private int _cooldownCounter;
    private bool _isInCooldown;

    private Button _btn;

    void Awake()
    {
        _btn = GetComponent<Button>();
    }

    void Start()
    {
        _btn.onClick.AddListener(()=>{
            if (BattleController.Instance) {
                BattleController.Instance.OnSkillButtonClick(_skillId);
                if (_cooldown > 0) {
                    _isInCooldown = true;
                }
            }
        });
    }

    public void Disable()
    {
        _btn.interactable = false;
    }

    public void SetIsInteractable(bool flag)
    {
        if (flag && _isInCooldown)
        {
            _cooldownCounter++;
            if (_cooldownCounter >= _cooldown) {
                _cooldownCounter = 0;
                _isInCooldown = false;
            } else {
                return;
            }
        }
        if (_btn != null)
            _btn.interactable = flag;
    }
}
