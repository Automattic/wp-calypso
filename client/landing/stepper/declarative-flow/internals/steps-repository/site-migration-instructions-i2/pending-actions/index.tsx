import { Spinner } from '@wordpress/components';
import { Icon, check, closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { FC } from 'react';
import './style.scss';

interface VisualStateIndicatorProps {
	state: 'idle' | 'pending' | 'success' | 'error';
	text: string;
}

const VisualStateIndicator = ( { state, text }: VisualStateIndicatorProps ) => {
	let icon: string | JSX.Element;

	switch ( state ) {
		case 'pending':
			icon = <Spinner />;
			break;
		case 'success':
			icon = <Icon icon={ check } width={ 30 } />;
			break;
		case 'error':
			icon = <Icon icon={ closeSmall } width={ 30 } />;
			break;
		default:
			icon = '';
			break;
	}

	return (
		<span className={ clsx( 'pending-actions__action', `pending-actions__action--${ state }` ) }>
			{ text }
			<span className="pending-actions__action-icon">{ icon }</span>
		</span>
	);
};

type Status = 'idle' | 'pending' | 'success' | 'error';
interface Props {
	status?: {
		siteTransfer: Status;
		pluginInstallation: Status;
		migrationKey: Status;
	};
}

export const PendingActions: FC< Props > = ( { status }: Props ) => {
	const { siteTransfer, pluginInstallation, migrationKey } = status || {};
	const allIdle = [ siteTransfer, pluginInstallation, migrationKey ].every( ( s ) => s === 'idle' );

	return (
		<div className="pending-actions">
			<span className="pending-actions__loading">
				{ translate( 'Wait until we finish setting up your site to continue' ) }
				{ allIdle && <Spinner /> }
			</span>
			<ul className="pending-actions__list">
				<li>
					<VisualStateIndicator
						state={ siteTransfer! }
						text={ translate( 'Provisioning your new site' ) }
					/>
				</li>
				<li>
					<VisualStateIndicator
						state={ pluginInstallation! }
						text={ translate( 'Installing the required plugins' ) }
					/>
				</li>
				{ migrationKey !== 'error' && (
					<li>
						<VisualStateIndicator
							state={ migrationKey! }
							text={ translate( 'Getting the migration key' ) }
						/>
					</li>
				) }
			</ul>
		</div>
	);
};
