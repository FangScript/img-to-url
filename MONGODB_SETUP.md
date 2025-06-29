# MongoDB Atlas Setup for Vercel Deployment

## Error: "your father dont have that much credits"

This error message appears when there's an issue with your MongoDB Atlas connection from Vercel. The most common reason is that **Vercel's IP addresses are not whitelisted in your MongoDB Atlas configuration**.

## How to Fix MongoDB Connection Issues

1. **Log in to MongoDB Atlas**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Sign in with your credentials

2. **Navigate to Network Access**:
   - Click on "Network Access" in the left sidebar
   - Click the "ADD IP ADDRESS" button

3. **Allow Access from Anywhere (for Vercel)**:
   - Click "ALLOW ACCESS FROM ANYWHERE"
   - This will add the IP address `0.0.0.0/0` which allows connections from any IP address
   - Click "Confirm"

4. **Alternative: Add Specific Vercel IP Ranges**:
   - If you prefer not to open access to all IPs, you can add specific Vercel IP ranges
   - Vercel uses AWS, so you'll need to add AWS IP ranges
   - This is more complex and may require updates if Vercel changes their infrastructure

5. **Check Database User Permissions**:
   - Go to "Database Access" in the sidebar
   - Ensure your database user has the necessary permissions (at least "readWrite" on your database)

6. **Verify Connection String**:
   - Make sure your connection string in `vercel.json` is correct
   - Current string: `mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

7. **Redeploy Your Application**:
   - After making these changes, redeploy your application to Vercel
   - Run: `npx vercel --prod`

## MongoDB Atlas Free Tier Limitations

- **Storage**: 512MB storage limit
- **Connections**: Limited to 100 connections
- **Compute**: Limited processing power
- **Network**: Limited bandwidth

If you continue to face issues after implementing these changes, consider:
1. Checking MongoDB Atlas logs for specific errors
2. Upgrading to a paid tier if you're hitting resource limits
3. Implementing better error handling in your application 