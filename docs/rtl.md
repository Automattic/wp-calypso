# RTL Testing

To test the Calypso interface in RTL-mode, you need to set your interface language to something which is RTL (e.g. Hebrew) at [Me → Account](https://wordpress.com/me/account).

If you are testing in your local development environment, you will also need to build the RTL CSS, which the development server skips by default. Start it with `BUILD_RTL_CSS=true`:

```bash
BUILD_RTL_CSS=true yarn start
# or, with Vite
BUILD_RTL_CSS=true yarn start:vite
```

Without it, RTL locales get the LTR styles, and Calypso shows an "RTLCSS off" badge.
