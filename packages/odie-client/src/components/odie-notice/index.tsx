import './style.scss';
import { useState } from '@wordpress/element';
import { Icon, close } from '@wordpress/icons';

interface OdieNoticeProps {
	children: React.ReactNode;
}

export const OdieNotice: React.FC< OdieNoticeProps > = ( props ) => {
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
