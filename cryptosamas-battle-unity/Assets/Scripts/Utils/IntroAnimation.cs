using UnityEngine;
using UnityEngine.UI;
using DG.Tweening;

public class IntroAnimation : MonoBehaviour
{
    [SerializeField]
    private RectTransform _welcomeLabel;

    [SerializeField]
    private CanvasGroup _battlefield;

    [SerializeField]
    private Image _background;

    void Start()
    {
        #if UNITY_EDITOR
        _background.color = Color.white;
        _battlefield.alpha = 1f;
        #else
        _background.DOFade(1f, 1f);
        DOVirtual.DelayedCall(0.5f, ()=> {
            _welcomeLabel.DOScale(Vector3.one, 1f).SetEase(Ease.OutBack).OnComplete(()=>{
                DOVirtual.DelayedCall(0.4f, ()=> {
                    _welcomeLabel.DOScale(Vector3.zero, 1f).SetEase(Ease.InBack);
                    DOVirtual.DelayedCall(0.75f, ()=> {
                        float alpha = 0;
                        DOTween.To(() => alpha, x => alpha = x, 1f, 1.5f).SetEase(Ease.OutBack)
                        .OnUpdate(() => {
                            _battlefield.alpha = alpha;
                        });
                    });
                });
            });
        });
        #endif
    }
}