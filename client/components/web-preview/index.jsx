import AsyncLoad from 'calypso/components/async-load';

const WebPreview = ( props ) => {
	if ( ! props.showPreview ) {
		return null;
	}

	return (
		<AsyncLoad
			require={ () =>
				import(
					/* webpackChunkName: "async-load-calypso-components-web-preview-component" */ 'calypso/components/web-preview/component'
				)
			}
			placeholder={ null }
			{ ...props }
		/>
	);
};

export default WebPreview;
