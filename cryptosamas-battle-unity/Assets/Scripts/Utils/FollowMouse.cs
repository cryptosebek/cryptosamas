using UnityEngine;

public class FollowMouse : MonoBehaviour
{
    private const float SENSITIVITY = 7f,
                        X_LIMIT = 21f,
                        Y_LIMIT = 16f;

    private void Start()
    {
        Reset();
    }

     private void Update()
     {
        Vector3 mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
        mousePos.z = 0f;

        Vector3 objectPos = transform.position;
        objectPos.z = 0f;

        float dirX = (new Vector2(mousePos.x, 0) - new Vector2(objectPos.x, 0)).sqrMagnitude * SENSITIVITY;
        float dirY = (new Vector2(0, mousePos.y) - new Vector2(0, objectPos.y)).sqrMagnitude * SENSITIVITY;

        transform.rotation = Quaternion.Euler(new Vector3(
            Mathf.Clamp(mousePos.y > objectPos.y ? dirY : dirY * -1f, -Y_LIMIT, Y_LIMIT),
            Mathf.Clamp(mousePos.x > objectPos.x ? dirX * -1f : dirX, -X_LIMIT, X_LIMIT),
            0));
     }

     public void Reset()
     {
         transform.rotation = Quaternion.Euler(new Vector3(0,0,0));
     }
}
