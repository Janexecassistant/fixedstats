# Flat Rate Frenzy Deployment Guide

Flat Rate Frenzy is a static browser game. It does not require a database, build step, backend server, paid library, or package install.

## Files To Upload

Upload these files together into the same public web folder:

```text
index.html
style.css
script.js
```

Optional but recommended:

```text
DEPLOYMENT.md
```

Do not rename the files unless you also update the references inside `index.html`.

## Basic Hosting Options

### Option 1: Shared Hosting Or cPanel

1. Log in to your hosting control panel.
2. Open File Manager.
3. Go to the public website folder, usually one of these:

```text
public_html
www
htdocs
```

4. Upload `index.html`, `style.css`, and `script.js`.
5. Visit your domain in a browser.

Example:

```text
https://yourdomain.com/
```

If you put the game in a subfolder named `flat-rate-frenzy`, visit:

```text
https://yourdomain.com/flat-rate-frenzy/
```

### Option 2: Netlify

1. Create a new site in Netlify.
2. Drag the project folder into the Netlify deploy area.
3. Make sure the folder contains `index.html`, `style.css`, and `script.js` at the top level.
4. Netlify will give you a playable URL.

No build command is needed.

Publish directory:

```text
/
```

### Option 3: GitHub Pages

1. Create a GitHub repository.
2. Add `index.html`, `style.css`, and `script.js`.
3. Push the files to GitHub.
4. In the repository, go to Settings > Pages.
5. Set the source branch to `main`.
6. Set the folder to `/root`.
7. Save and wait for GitHub Pages to publish.

Your game URL will look like:

```text
https://your-username.github.io/repository-name/
```

### Option 4: Simple Linux Server With Nginx

Copy the files to a web directory:

```bash
sudo mkdir -p /var/www/flat-rate-frenzy
sudo cp index.html style.css script.js /var/www/flat-rate-frenzy/
```

Example Nginx config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/flat-rate-frenzy;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Then reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Local Test Before Upload

From the game folder, run:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/index.html
```

## Save Data

The game saves progress in the player browser using `localStorage`.

This means:

- Progress stays on the same device and browser.
- Progress does not transfer automatically between computers.
- No server database is required.
- Clearing browser data will reset progress.

## Server Requirements

Minimum requirements:

- Static file hosting
- HTTPS recommended
- MIME support for `.html`, `.css`, and `.js`

No required:

- Node.js
- PHP
- MySQL
- npm install
- Build pipeline

## Post-Upload Checklist

After uploading, test these items:

1. The start screen loads.
2. The dashboard opens after pressing Start Game.
3. A repair order can be started.
4. The service bay shows the technician and clickable stations.
5. The timer counts down.
6. Job progress advances when the correct station is clicked.
7. Random shop events or MPVI findings can be answered.
8. The job complete screen appears.
9. Progress remains after refreshing the page.
10. The game works on a phone-sized screen.

## Common Problems

### The page loads but has no styling

Make sure `style.css` is in the same folder as `index.html`.

### The game does not respond

Make sure `script.js` is in the same folder as `index.html`.

### Progress does not save

Check that the browser is not blocking local storage or running in private browsing mode.

### The game is inside a subfolder

That is fine. The current file references are relative, so this works:

```text
/flat-rate-frenzy/index.html
/flat-rate-frenzy/style.css
/flat-rate-frenzy/script.js
```

## Updating The Game Later

To update the live game:

1. Edit the local files.
2. Test locally.
3. Upload the changed files to the server.
4. Refresh the browser.

If the old version still appears, clear the browser cache or hard refresh.

