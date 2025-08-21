import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';

interface NonPrimaryDomainProps {
	planeName: string;
	oldDomainName: string;
	newDomainName: string;
	hasSetupAds: boolean;
	isOpen: boolean;
	onConfirm: () => void;
}

type ConfirmDialogProps = Omit< React.ComponentProps< typeof ConfirmDialog >, 'children' >;
type Props = NonPrimaryDomainProps & ConfirmDialogProps;

export default function NonPrimaryDomainDialog( {
	planeName,
	oldDomainName,
	newDomainName,
	hasSetupAds,
	onConfirm,
	...props
}: Props ) {
	return (
		<ConfirmDialog confirmButtonText={ __( 'Remove plan' ) } onConfirm={ onConfirm } { ...props }>
			<VStack spacing={ 2 }>
				<Text as="p">
					{ createInterpolateElement(
						// translators: %(oldDomain)s and %(newDomain)s are placeholders for domain names
						__(
							'When you downgrade your <planName /> plan, <oldDomain /> will immediately start forwarding to <newDomain />.'
						),
						{
							planName: <span>{ planeName }</span>,
							newDomain: <strong>{ newDomainName }</strong>,
							oldDomain: <strong>{ oldDomainName }</strong>,
						}
					) }
				</Text>
				<Text as="p">
					{ createInterpolateElement(
						__( '<newDomain /> will be the address that people see when they visit your site.' ),
						{
							newDomain: <strong>{ newDomainName }</strong>,
						}
					) }
				</Text>
				{ hasSetupAds && (
					<Text as="p">
						{ createInterpolateElement(
							__(
								'You will also be ineligible for the WordAds program. Visit <faqLink>our FAQ</faqLink> to learn more.'
							),
							{
								faqLink: (
									<InlineSupportLink supportLink="https://wordads.co/faq/#eligibility-for-wordads" />
								),
							}
						) }
					</Text>
				) }
			</VStack>
		</ConfirmDialog>
	);
}
