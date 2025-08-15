import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ActionList } from '../../components/action-list';
import { SectionHeader } from '../../components/section-header';

export default function Actions() {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader level={ 3 } title={ __( 'Actions' ) } />
			<ActionList>
				<ActionList.ActionItem
					title={ __( 'Renew' ) }
					description={ __( 'Renew domain registration.' ) }
					actions={ <Button variant="secondary">{ __( 'Renew' ) }</Button> }
				/>
				<ActionList.ActionItem
					title={ __( 'Transfer' ) }
					description={ __( 'Transfer this domain to another site or WordPress.com user.' ) }
					actions={ <Button variant="secondary">{ __( 'Transfer' ) }</Button> }
				/>
				<ActionList.ActionItem
					title={ __( 'Detach' ) }
					description={ __( 'Detach this domain from the site.' ) }
					actions={ <Button variant="secondary">{ __( 'Detach' ) }</Button> }
				/>
				<ActionList.ActionItem
					title={ __( 'Delete' ) }
					description={ __( 'Remove this domain permanently.' ) }
					actions={
						<Button variant="secondary" isDestructive>
							{ __( 'Delete' ) }
						</Button>
					}
				/>
			</ActionList>
		</VStack>
	);
}
