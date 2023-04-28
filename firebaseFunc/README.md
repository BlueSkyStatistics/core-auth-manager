First you need to login the firebase. To do this, run the following command 
```
firebase login 
```

after this you'd meed to install all dependencies for function in "funstions" folder. To do this, run the following command 
```
npm install
```

To deploy the function, run the following command 
```
firebase deploy --only functions
```

Once deployed check that you are able to invoke the function 

in case not - verify you have granted permissions to all users to invoke the function. To do this, follow the steps below:

1. On the Cloud Functions homepage, highlight the Cloud Function you want to add all access to.
2. Click "Permissions" on the top bar.
3. Click "Add Principal" and type "allUsers" then select "Cloud Function Invokers" under "Cloud Function" in the Role box.
4. Click "Save"
5. Click "Allow Public Access"