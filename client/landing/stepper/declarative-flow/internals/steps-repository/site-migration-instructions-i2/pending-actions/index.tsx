import { Spinner } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { FC } from 'react';
import './style.scss';

interface VisualStateIndicatorProps {
	state: 'pending' | 'success' | 'error';
	text: string;
}

const VisualStateIndicator = ( { state, text }: VisualStateIndicatorProps ) => {
	let icon: string | JSX.Element;
	switch ( state ) {
		case 'pending':
			icon = <Spinner />;
			break;
		case 'success':
			icon = <Icon icon={ check } width={ 20 } />;
			break;
		case 'error':
			icon = '❌';
			break;
		default:
			icon = '';
			break;
	}
	return (
		<span className="pending-actions__action">
			{ state === 'pending' && <i>{ text }</i> }
			{ state !== 'pending' && text }
			<span className="pending-actions__action--icon">{ icon }</span>
		</span>
	);
};

interface Props {
	isWaitingForSite: boolean;
	isWaitingForPlugins: boolean;
}

export const PendingActions: FC< Props > = ( { isWaitingForSite, isWaitingForPlugins }: Props ) => {
	return (
		<div className="pending-actions">
			{ translate( 'Wait until we finish setting up your site to continue' ) }
			<ul className="pending-actions__list">
				<li>
					<VisualStateIndicator
						state={ isWaitingForSite ? 'pending' : 'success' }
						text={ translate( 'Creating your site' ) }
					/>
				</li>
				<li
					className={ classNames( 'fade-in', {
						active: ! isWaitingForSite,
					} ) }
				>
					<VisualStateIndicator
						state={ isWaitingForPlugins ? 'pending' : 'success' }
						text={ translate( 'Installing the required plugins' ) }
					/>
				</li>
			</ul>
		</div>
	);
};
