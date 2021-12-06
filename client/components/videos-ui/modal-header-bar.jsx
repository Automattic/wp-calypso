import { Gridicon } from '@automattic/components';

import './modal-header-bar.scss';

const ModalHeaderBar = ( { onClose = () => {} } ) => {
	return (
		<div className={ 'videos-ui__bar videos-ui__header-bar videos-ui__modal-header-bar' }>
			<Gridicon icon="my-sites" size={ 24 } />
			<span role="button" onKeyDown={ onClose } tabIndex={ 0 } onClick={ onClose }>
				<Gridicon icon="cross" size={ 24 } />
			</span>
		</div>
	);
};

export default ModalHeaderBar;
