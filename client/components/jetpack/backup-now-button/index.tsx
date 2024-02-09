import { Button, Tooltip } from '@wordpress/components';
import { FunctionComponent } from 'react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	children?: React.ReactNode;
	disabled?: boolean;
	label?: string;
	toolTipText?: string;
	trackEventName?: string;
	variant: 'primary' | 'secondary' | 'tertiary';
}

const BackupNowButton: FunctionComponent< Props > = ( {
	children,
	disabled = false,
	toolTipText,
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

	return (
		<>
			{ toolTipText ? (
				<Tooltip text={ toolTipText }>{ button }</Tooltip>
			) : (
				<button onClick={ handleClick } disabled={ disabled }>
					{ button }
				</button>
			) }
		</>
	);
};

export default BackupNowButton;
