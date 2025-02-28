import { SelectDropdown } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import transformIcon from '@automattic/domains-table/src/bulk-actions-toolbar/transform.svg';
import { Button } from '@wordpress/components';
import { RenderModalProps } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDomainsDataViewsContext } from '../use-context';

import './auto-renew-dialog.scss';

export const AutoRenewDiolog = ( {
	items,
	closeModal,
	onActionPerformed,
}: RenderModalProps< PartialDomainData > ) => {
	const { handleAutoRenew } = useDomainsDataViewsContext();
	const translate = useTranslate();
	const [ controlKey, setControlKey ] = useState( 1 );
	const [ value, setValue ] = useState< string | undefined >( undefined );

	const enableLabel = translate( 'Turn {{strong}}on{{/strong}} auto-renew', {
		components: { strong: <strong /> },
	} );

	const disableLabel = translate( 'Turn {{strong}}off{{/strong}} auto-renew', {
		components: { strong: <strong /> },
	} );

	const onUpdateAutoRenew = () => {
		if ( value === 'enable' ) {
			handleAutoRenew( items, true );
		} else if ( value === 'disable' ) {
			handleAutoRenew( items, false );
		}

		// By default the SelectDropdown will "select" the item that was clicked. We don't
		// want this so we force the components internal state to be reset, which keeps
		// the selection set to `initialSelected="button-label"`.
		setControlKey( ( oldKey ) => oldKey + 1 );

		onActionPerformed?.( items );
		closeModal?.();
	};

	const updateButtonDisbled = [ undefined, 'button-label' ].includes( value );

	return (
		<div className="domains-dataviews-bulk-actions-dialog">
			<p className="domains-dataviews-bulk-actions-dialog__description">
				{ translate(
					/* translators: domainCount will be the number of domains to update */
					'Update auto-renew settings for %(domainCount)d domain',
					'Update auto-renew settings for %(domainCount)d domains',
					{
						count: items.length,
						args: {
							domainCount: items.length,
						},
					}
				) }
			</p>
			<SelectDropdown
				key={ controlKey }
				className="domains-dataviews-bulk-actions-dialog__select"
				initialSelected="button-label"
				showSelectedOption={ false }
				onSelect={ ( { value: v }: { value: string } ) => setValue( v ) }
				options={ [
					{
						value: 'button-label',
						label: translate( 'Choose new status…' ),
						icon: (
							<img
								className="domains-dataviews-bulk-actions-dialog__icon"
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

			<div className="domains-dataviews-bulk-actions-dialog__actions">
				<Button variant="tertiary" onClick={ closeModal }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button variant="primary" onClick={ onUpdateAutoRenew } disabled={ updateButtonDisbled }>
					{ translate( 'Update' ) }
				</Button>
			</div>
		</div>
	);
};
