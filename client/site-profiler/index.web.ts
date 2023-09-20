import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { siteProfilerContext } from 'calypso/site-profiler/controller';

export default function () {
	page( '/site-profiler', siteProfilerContext, makeLayout, clientRender );
}
