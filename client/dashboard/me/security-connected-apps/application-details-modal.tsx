import { Badge } from '@automattic/ui';
import {
	Modal,
	ExternalLink,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import type { ConnectedApplication } from '@automattic/api-core';

interface Props {
	application: ConnectedApplication;
	onClose: () => void;
}

const getAccessScopeDetails = ( scope: string, site?: { site_name: string; site_URL: string } ) => {
	switch ( scope ) {
		case 'global':
			return {
				label: __( 'Global' ),
				value: __(
					'This connection is allowed to manage all of your blogs on WordPress.com, including any Jetpack blogs that are connected to your WordPress.com account.'
				),
			};
		case 'auth':
			return {
				label: __( 'Authentication' ),
				value: __( 'This connection is not allowed to manage any of your blogs.' ),
			};
		default:
			return site
				? {
						label: site.site_name,
						value: createInterpolateElement(
							// translators: %(siteLink)s will be replaced with the site name.
							__( 'This connection is only allowed to access <siteLink />' ),
							{
								siteLink: <ExternalLink href={ site.site_URL }>{ site.site_name }</ExternalLink>,
							}
						),
				  }
				: {
						label: '',
						value: '',
				  };
	}
};

const DetailItem = ( { label, value }: { label: string; value: React.ReactNode } ) => {
	return (
		<VStack spacing={ 2 }>
			<Text upperCase lineHeight="16px" size={ 11 } weight={ 500 }>
				{ label }
			</Text>
			<Text lineHeight="16px" size={ 13 } weight={ 400 }>
				{ value }
			</Text>
		</VStack>
	);
};

export default function ApplicationDetailsModal( { application, onClose }: Props ) {
	const userLocale = useLocale();

	const siteObj =
		application.site && typeof application.site === 'object' ? application.site : undefined;

	const accessScopeDetails = getAccessScopeDetails( application.scope, siteObj );

	return (
		<Modal onRequestClose={ onClose } title={ application.title } size="medium">
			<VStack spacing={ 6 }>
				<DetailItem
					label={ __( 'Application website' ) }
					value={ <ExternalLink href={ application.URL }>{ application.URL }</ExternalLink> }
				/>
				<DetailItem
					label={ __( 'Authorized on' ) }
					value={ new Intl.DateTimeFormat( userLocale, {
						dateStyle: 'long',
						timeStyle: 'medium',
					} ).format( new Date( application.authorized ) ) }
				/>
				{ accessScopeDetails && (
					<DetailItem
						label={ __( 'Access scope' ) }
						value={
							<VStack spacing={ 2 }>
								<Badge
									intent="default"
									style={ {
										maxWidth: 'fit-content',
									} }
								>
									{ accessScopeDetails.label }
								</Badge>
								<Text lineHeight="16px" size={ 13 } weight={ 400 }>
									{ accessScopeDetails.value }
								</Text>
							</VStack>
						}
					/>
				) }
				<DetailItem
					label={ __( 'Access permissions' ) }
					value={
						<ul style={ { paddingInlineStart: '20px', margin: 0 } }>
							{ application.permissions.map( ( permission ) => (
								<Text as="li" lineHeight="20px" size={ 13 } weight={ 400 } key={ permission.name }>
									{ permission.description }
								</Text>
							) ) }
						</ul>
					}
				/>
			</VStack>
		</Modal>
	);
}
