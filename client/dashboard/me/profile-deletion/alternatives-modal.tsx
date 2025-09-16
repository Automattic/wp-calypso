import { localizeUrl } from '@automattic/i18n-utils';
import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight, help } from '@wordpress/icons';
import ActionList from '../../components/action-list';
import { ButtonStack } from '../../components/button-stack';
import RouterLinkButton from '../../components/router-link-button';

interface AlternativeOption {
	text: string;
	to: string;
	supportLink?: string;
	useRouterButton?: boolean;
}

interface AlternativesModalProps {
	onClose: () => void;
	onContinue: () => void;
	siteCount?: number;
}

export default function AlternativesModal( {
	onClose,
	onContinue,
	siteCount = 0,
}: AlternativesModalProps ) {
	const alternativeOptions: AlternativeOption[] = [
		...( siteCount > 0
			? [
					{
						text: __( "Change your site's address" ),
						to: '/domains',
						supportLink: localizeUrl( 'https://wordpress.com/support/changing-site-address/' ),
					},
					{
						text: __( 'Delete a site' ),
						to: '/sites',
						supportLink: localizeUrl( 'https://wordpress.com/support/delete-site/' ),
					},
			  ]
			: [] ),
		{
			text: __( 'Start a new site' ),
			to: '/start?ref=me-account-close',
			supportLink: localizeUrl( 'https://wordpress.com/support/create-a-blog/' ),
			useRouterButton: false,
		},
		{
			text: __( 'Change your username' ),
			to: '/me/account',
			supportLink: localizeUrl( 'https://wordpress.com/support/change-your-username/' ),
		},
		{
			text: __( 'Change your password' ),
			to: '/me/security',
			supportLink: localizeUrl( 'https://wordpress.com/support/passwords/' ),
		},
	];

	return (
		<Modal title={ __( 'Are you sure?' ) } onRequestClose={ onClose }>
			<VStack spacing={ 6 }>
				<Text>
					{ __( "Here's a few options to try before you permanently delete your account." ) }
				</Text>
				<ActionList>
					{ alternativeOptions.map( ( option ) => (
						<ActionList.ActionItem
							key={ option.to }
							title={ option.text }
							actions={
								<HStack spacing={ 0 } expanded={ false }>
									{ option.supportLink && (
										<Button
											variant="tertiary"
											icon={ help }
											size="compact"
											href={ option.supportLink }
											target="_blank"
											rel="noopener noreferrer"
											aria-label={ __( 'Get help' ) }
										/>
									) }
									{ option.useRouterButton ? (
										<RouterLinkButton
											__next40pxDefaultSize
											variant="tertiary"
											icon={ isRTL() ? chevronLeft : chevronRight }
											size="compact"
											to={ option.to }
											rel="noopener noreferrer"
											aria-label={ option.text }
										/>
									) : (
										<Button
											variant="tertiary"
											icon={ isRTL() ? chevronLeft : chevronRight }
											size="compact"
											href={ option.to }
											rel="noopener noreferrer"
											aria-label={ option.text }
										/>
									) }
								</HStack>
							}
						/>
					) ) }
				</ActionList>
				<ButtonStack justify="flex-end">
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" onClick={ onContinue }>
						{ __( 'Continue' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
