import { FormLabel } from '@automattic/components';
import { useState } from '@wordpress/element';
import { ChangeEvent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { useSubscriberImportMutation } from 'calypso/data/paid-newsletter/use-subscriber-import-mutation';
import ImporterActionButton from '../../importer-action-buttons/action-button';

type Props = {
	step: string;
	engine: string;
	siteId: number;
	hasPaidSubscribers: boolean;
	navigate?: () => void;
};
export default function StartImportButton( {
	siteId,
	hasPaidSubscribers,
	step,
	engine,
	navigate = () => {},
}: Props ) {
	const [ isDisabled, setIsDisabled ] = useState( ! hasPaidSubscribers );

	const { enqueueSubscriberImport } = useSubscriberImportMutation();

	const importSubscribers = () => {
		enqueueSubscriberImport( siteId, engine, step );
		navigate();
	};

	const onChange = ( { target: { checked } }: ChangeEvent< HTMLInputElement > ) =>
		setIsDisabled( checked );

	return (
		<>
			{ hasPaidSubscribers && (
				<>
					<p>
						<strong>To prevent any unexpected actions by your old provider</strong>, go to your
						Stripe dashboard and click “Revoke access” for any service previously associated with
						this subscription.
					</p>

					<p>
						<FormLabel>
							<FormCheckbox checked={ isDisabled } onChange={ onChange } />
							I’ve disconnected other providers from the Stripe account
						</FormLabel>
					</p>
				</>
			) }
			<ImporterActionButton primary disabled={ ! isDisabled } onClick={ importSubscribers }>
				Import subscribers
			</ImporterActionButton>
		</>
	);
}
