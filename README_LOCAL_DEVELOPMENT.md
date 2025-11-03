# Local Development Setup

## The Problem

When you open `index.html` directly in a browser (using `file://` protocol), modern browsers block loading other local files (like `publications.xlsx`) due to CORS (Cross-Origin Resource Sharing) security restrictions.

## Solution: Use a Local Web Server

You have several options to run a local web server:

### Option 1: Use the Provided Python Script (Easiest)

1. Run the local server script:
   ```bash
   python3 start_local_server.py
   ```

2. The script will automatically:
   - Start a web server on port 8000
   - Open your browser to `http://localhost:8000`

3. Your website will now work perfectly with the Excel file loading!

4. Press `Ctrl+C` to stop the server when done.

### Option 2: Use Python's Built-in HTTP Server

1. Navigate to your project directory:
   ```bash
   cd /Users/mingxunz/Documents/wuwuz.github.io
   ```

2. Start the server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser to: `http://localhost:8000`

4. Press `Ctrl+C` to stop the server.

### Option 3: Use Node.js Serve (if you have Node.js)

1. Install serve (if not already installed):
   ```bash
   npm install -g serve
   ```

2. Run serve:
   ```bash
   npx serve
   ```

3. Follow the instructions it prints.

### Option 4: Use VS Code Live Server Extension

If you use VS Code:

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Why This Is Needed

- **GitHub Pages**: When deployed, your site uses `https://` protocol, which allows loading files normally
- **Local Testing**: Browsers block `file://` protocol from loading other files for security
- **Local Server**: Using `http://localhost` simulates the real web environment and bypasses CORS restrictions

## Testing Checklist

- [ ] Server is running
- [ ] Open `http://localhost:8000` (or the port your server uses)
- [ ] Publications load successfully
- [ ] Filters work correctly
- [ ] No console errors

## Troubleshooting

**Port already in use?**
- Change the port number in `start_local_server.py` (line with `PORT = 8000`)
- Or stop the other process using that port

**Still getting errors?**
- Check browser console (F12) for specific error messages
- Ensure `publications.xlsx` is in the same directory as `index.html`
- Verify the Excel file has the correct column headers

