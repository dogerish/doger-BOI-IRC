# doger-BOI-IRC
IRC with discord channel
## config.json
Copy template.json to config.json and fill in the bot token and guild and channel id.
## color-scheme.json
Describes the colors to use for certain things. Colors are represented by escape sequence numbers, following the format
```
	"attribute": "color_on color_off"
```
`color_on` is the color formatting to be used when `color` in config.json is true.
`color_off` is the formatting for when it is false. The default value for `color_off` is the value of `default` or 0.
To use them in a string, put the name of the attribute inside of <> and then call format on the string. Example:
```javascript
format("<t>Title<d> plain text <st>subtitle<d> and back to default. Here is a url: <url>http://github.com<d>");
```
### Attributes
* d = default
* t = title
* s = subtitle
