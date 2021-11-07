import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

type OwnProps = {
	isExpanded?: boolean;
	onToggle?: () => void;
};

const ExpandContent: React.FC< OwnProps > = ( { isExpanded = false, onToggle } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const toggleWithTracking = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_content_expand' ) );
		onToggle?.();
	};

	const toggleContentOnSpace: React.KeyboardEventHandler = ( { key } ) => {
		if ( key === ' ' ) {
			toggleWithTracking();
		}
	};

	return (
		<Button
			compact
			borderless
			className="toolbar__see-content-link"
			onClick={ toggleWithTracking }
			onKeyDown={ toggleContentOnSpace }
		>
			{ isExpanded ? translate( 'Hide content' ) : translate( 'See content' ) }
			<Gridicon
				size={ 18 }
				icon={ isExpanded ? 'chevron-up' : 'chevron-down' }
				className="toolbar__see-content-icon"
			/>
		</Button>
	);
};

export default ExpandContent;
