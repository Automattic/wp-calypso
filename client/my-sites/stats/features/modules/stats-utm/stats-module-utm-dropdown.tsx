import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, chevronDown, chevronUp, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useState, useRef } from 'react';
import { OPTION_KEYS as SELECTED_OPTION_KEYS } from './stats-module-utm';

import './stats-module-utm-dropdown.scss';

interface UTMDropdownProps {
	className: string;
	buttonLabel: string;
	onSelect: ( key: string ) => void;
	selectOptions: Record< string, { selectLabel: string; isGrouped?: boolean } >;
	selected: keyof typeof SELECTED_OPTION_KEYS;
}

const BASE_CLASS_NAME = 'stats-utm-picker';

const UTMDropdown: React.FC< UTMDropdownProps > = ( {
	className,
	buttonLabel,
	onSelect,
	selectOptions,
	selected, // which option is indicated as selected
} ) => {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const infoReferenceElement = useRef( null );
	const [ popoverOpened, togglePopoverOpened ] = useState( false );

	const togglePopoverVisibility = () => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';

		if ( ! popoverOpened ) {
			// record an event for opening the date picker
			recordTracksEvent( `${ event_from }_stats_utm_dropdown_opened` );
		}

		togglePopoverOpened( ! popoverOpened );
	};

	const handleOptionSelection = ( key: string ) => {
		onSelect( key );

		// publish an event
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_utm_dropdown_option_selected`, {
			option: key,
		} );

		togglePopoverOpened( false );
	};

	return (
		<div className={ clsx( className, BASE_CLASS_NAME ) }>
			<Button onClick={ togglePopoverVisibility } ref={ infoReferenceElement }>
				{ buttonLabel }
				{ popoverOpened ? (
					<Icon className="gridicon" icon={ chevronUp } />
				) : (
					<Icon className="gridicon" icon={ chevronDown } />
				) }
			</Button>
			<Popover
				position="bottom"
				context={ infoReferenceElement?.current }
				isVisible={ popoverOpened }
				className={ `${ BASE_CLASS_NAME }__popover-wrapper` }
				onClose={ () => togglePopoverOpened( false ) }
				hideArrow
			>
				<ul className={ `${ BASE_CLASS_NAME }__popover-list` }>
					{ Object.entries( selectOptions ).map( ( [ key, option ], index ) => {
						const isSelected = key === selected;

						return (
							<li
								key={ key }
								className={ clsx( `${ BASE_CLASS_NAME }__popover-list-item`, {
									[ 'is-selected' ]: isSelected,
									[ 'is-grouped' ]: option.isGrouped,
									[ 'is-not-grouped' ]: ! option.isGrouped,
								} ) }
							>
								<Button key={ index } onClick={ () => handleOptionSelection( key ) }>
									<span>{ option.selectLabel }</span>
									{ isSelected && <Icon icon={ check } /> }
								</Button>
							</li>
						);
					} ) }
				</ul>
			</Popover>
		</div>
	);
};

export default UTMDropdown;
