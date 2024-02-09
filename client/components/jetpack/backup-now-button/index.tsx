import { Button, Tooltip } from '@wordpress/components';
import { FunctionComponent } from 'react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	children?: React.ReactNode;
	disabled?: boolean;
	label?: string;
	tooltipText?: string;
	trackEventName?: string;
	variant: 'primary' | 'secondary' | 'tertiary';
}

const BackupNowButton: FunctionComponent< Props > = ( {
	children,
	disabled = false,
	tooltipText,
	trackEventName,
	variant,
} ) => {
	const handleClick = () => {
		if ( trackEventName ) {
			recordTracksEvent( trackEventName );
		}
	};

	const button = (
		<Button variant={ variant } onClick={ handleClick } disabled={ disabled }>
			{ children }
		</Button>
	);

	return <>{ tooltipText ? <Tooltip text={ tooltipText }>{ button }</Tooltip> : button }</>;
};

export default BackupNowButton;
