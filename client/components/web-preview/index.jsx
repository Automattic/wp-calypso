import AsyncLoad from 'calypso/components/async-load';

const loadComponent = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-web-preview-component" */ 'calypso/components/web-preview/component'
	);

const WebPreview = ( props ) => {
	if ( ! props.showPreview ) {
		return null;
	}

	return <AsyncLoad require={ loadComponent } placeholder={ null } { ...props } />;
};

export default WebPreview;
