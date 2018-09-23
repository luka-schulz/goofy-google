## Goofy Google
A web crawler of sorts that implements its logic using the im2txt model via Runway

### Instructions
1) Open Docker and Runway
2) Set up a SimpleHTTP Server from the working directory (type `python -m SimpleHTTPServer` into the command line / terminal)
3) Open the script.js and change line 55 to the proper url provided by Runway

When you open the file (localhost:8000) it should open the index.html file and be connected. CORS issues will occur rather quickly, but you can switch out the image easily to explore how the results change.
