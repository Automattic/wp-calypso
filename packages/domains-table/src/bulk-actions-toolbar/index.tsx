import { SelectDropdown } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import transformIcon from './transform.svg';
import './style.scss';

interface BulkActionsToolbarProps {
	onAutoRenew: ( enable: boolean ) => void;
	selectedDomainCount: number;
}

export function BulkActionsToolbar( {
	onAutoRenew,
	selectedDomainCount,
}: BulkActionsToolbarProps ) {
	const { __, _n } = useI18n();
	const [ controlKey, setControlKey ] = useState( 1 );

	const enableLabel = createInterpolateElement(
		sprintf(
			/* translators: domainCount will be the number of domains to update */
			_n(
				'Turn <b>on</b> auto-renew for %(domainCount)d domain',
				'Turn <b>on</b> auto-renew for %(domainCount)d domains',
				selectedDomainCount,
				__i18n_text_domain__
			),
			{ domainCount: selectedDomainCount }
		),
		{ b: <strong /> }
	);

	const disableLabel = createInterpolateElement(
		sprintf(
			/* translators: domainCount will be the number of domains to update */
			_n(
				'Turn <b>off</b> auto-renew for %(domainCount)d domain',
				'Turn <b>off</b> auto-renew for %(domainCount)d domains',
				selectedDomainCount,
				__i18n_text_domain__
			),
			{ domainCount: selectedDomainCount }
		),
		{ b: <strong /> }
	);

	const handleAutoRenewSelect = ( { value }: { value: string } ) => {
		if ( value === 'enable' ) {
			onAutoRenew( true );
		} else if ( value === 'disable' ) {
			onAutoRenew( false );
		}

		// By default the SelectDropdown will "select" the item that was clicked. We don't
		// want this so we force the components internal state to be reset, which keeps
		// the selection set to `initialSelected="button-label"`.
		setControlKey( ( oldKey ) => oldKey + 1 );
	};

	return (
		<div className="domains-table-bulk-actions-toolbar">
			<SelectDropdown
				key={ controlKey }
				className="domains-table-bulk-actions-toolbar__select"
				initialSelected="button-label"
				showSelectedOption={ false }
				onSelect={ handleAutoRenewSelect }
				options={ [
					{
						value: 'button-label',
						label: __( 'Auto-renew settings', __i18n_text_domain__ ),
						icon: (
							<img
								className="domains-table-bulk-actions-toolbar__icon"
								src={ transformIcon }
								width={ 18 }
								height={ 18 }
								alt=""
							/>
						),
					},
					{ value: 'enable', label: enableLabel },
					{ value: 'disable', label: disableLabel },
				] }
			/>
		</div>
	);
}
