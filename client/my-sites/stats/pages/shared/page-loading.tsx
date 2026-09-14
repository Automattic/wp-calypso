import { Spinner } from '@wordpress/components';

const PageLoading = (
	<div
		style={ {
			minHeight: 'calc( 100vh - 100px )',
			width: '100%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		} }
	>
		<Spinner />
	</div>
);

export default PageLoading;
