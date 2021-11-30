using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;
using UnityEngine.UI;

public class NFTCardsManager : MonoBehaviour
{

    [DllImport("__Internal")]
    private static extern string GetNFTData();

    [DllImport("__Internal")]
    private static extern void ReturnToWebsite();

    [SerializeField]
    private RawImage _playerCardImage;

    IEnumerator Start()
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        var nftData = GetNFTData();
        if (!string.IsNullOrEmpty(nftData)) {
            var www = new WWW(nftData);
            yield return www;
            _playerCardImage.texture = www.texture;
            // TODO: parse nft data json array and download images
        }
        #endif

        yield break;
    }

    public void OnBackToWebsite()
    {
        ReturnToWebsite();
    }
}
