import { Spinner } from '@wordpress/components';
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
			icon = '✅';
			break;
		case 'error':
			icon = '❌';
			break;
		default:
			icon = '';
			break;
	}
	return (
		<>
			<span className="visual-state-indicator">{ icon }</span>
			{ state === 'pending' && <i>{ text }</i> }
			{ state !== 'pending' && text }
		</>
	);
};

interface Props {
	// value: string;
	// className?: string;
}

export const PendingActions: FC< Props > = () => {
	const isWaitingForSomething = true;
	return (
		<div className="pending-actions">
			{ ! isWaitingForSomething && translate( 'Your new site is ready!' ) }

			{ isWaitingForSomething && (
				<>
					{ translate( "We are setting up your site, please wait until it's ready" ) }
					<ol>
						<li>
							<VisualStateIndicator state="success" text={ translate( 'Creating your site' ) } />
						</li>
						<li>
							<VisualStateIndicator
								state="pending"
								text={ translate( 'Installing required plugins' ) }
							/>
						</li>
					</ol>
				</>
			) }
		</div>
	);
};
