import json

from firebase_admin.exceptions import FirebaseError
from firebase_functions import https_fn
from firebase_admin import initialize_app, credentials, auth

# Load the service account key JSON file
cred = credentials.Certificate('firebaseAdmin.json')

initialize_app(cred)
# initialize_app()


# https://firebase.google.com/docs/functions/get-started?gen=2nd#python
@https_fn.on_request()
def get_token(req: https_fn.Request) -> https_fn.Response:
    try:
        id_token = req.headers['Authorization'].split(' ')[1]
    except KeyError:
        return https_fn.Response('Not authorized', status=403)
    try:
        # Verify the ID token while checking if the token is revoked by passing check_revoked=True.
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
        print('decoded_token')
        print(decoded_token)
        # Token is valid and not revoked.
        uid = decoded_token['uid']
        # If token is valid create a custom token
        if decoded_token:
            try:
                # Create a custom token
                custom_token = auth.create_custom_token(uid)
                print('custom_token')
                print(custom_token)
                return https_fn.Response(json.dumps({'token': custom_token.decode()}), status=200)
            except Exception as e:
                print(f'Error creating custom token for user {uid}: {e}')
                return https_fn.Response(f'Error creating custom token for user {uid}: {e}', status=403)
    except ValueError:
        # Token was not a valid ID token.
        return https_fn.Response('The provided authorization is invalid!', status=400)
    except FirebaseError as e:
        # Token was revoked. Inform the user to reauthenticate or signOut() the user.
        print(e)
        return https_fn.Response('The token was revoked!', status=403)

    return https_fn.Response('Could not create a custom token!', status=400)
