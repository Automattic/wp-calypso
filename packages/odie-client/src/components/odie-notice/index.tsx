import './style.scss';
import { useState } from '@wordpress/element';
import { Icon, close } from '@wordpress/icons';

const OdieNotice = ( props ) => {
	const [ isNoticeVisible, setIsNoticeVisible ] = useState( true );

	return (
		isNoticeVisible && (
			<div className="odie-notice">
				<div className="odie-notice__container">
					{ props.children }
					<button
						className="odie-notice__close-button"
						onClick={ () => setIsNoticeVisible( false ) }
					>
						<Icon icon={ close } size={ 12 } />
					</button>
				</div>
			</div>
		)
	);
};

export default OdieNotice;
