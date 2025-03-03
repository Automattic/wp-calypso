/**
 * External dependencies
 */
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useContext } from '@wordpress/element';
import { isRTL, __ } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { SidebarNavigationContext, SidebarButton } from '../';
import { useHistory } from '../../router';
import './style.scss';

type SidebarNavigationScreenProps = {
	isRoot: boolean;
	title: string;
	actions?: React.ReactNode;
	meta?: React.ReactNode;
	content: React.ReactNode;
	footer?: React.ReactNode;
	description?: string;
	backPath?: string;

	goBackLabel?: string; // not defined in core
	goBackLink?: string; // not defined in core
};

export function SidebarNavigationScreen( {
	isRoot,
	title,
	actions,
	meta,
	content,
	footer,
	description,
	backPath,
	goBackLabel = __( 'Go to the Dashboard', 'woocommerce-analytics' ),
	goBackLink = '/',
}: SidebarNavigationScreenProps ) {
	const history = useHistory();

	const { navigate } = useContext( SidebarNavigationContext );

	const icon = isRTL() ? chevronRight : chevronLeft;

	return (
		<>
			<VStack
				className={ clsx( 'a8c-site-admin-sidebar-navigation-screen__main', {
					'has-footer': !! footer,
				} ) }
				spacing={ 0 }
				justify="flex-start"
			>
				<HStack
					spacing={ 3 }
					alignment="flex-start"
					className="a8c-site-admin-sidebar-navigation-screen__title-icon"
				>
					{ ! isRoot && (
						<SidebarButton
							onClick={ () => {
								if ( ! backPath ) {
									return;
								}

								history.navigate( backPath );
								navigate( 'back' );
							} }
							icon={ icon }
							label={ __( 'Back', 'woocommerce-analytics' ) }
							showTooltip={ false }
						/>
					) }

					{ isRoot && <SidebarButton icon={ icon } label={ goBackLabel } href={ goBackLink } /> }

					<Heading
						className="a8c-site-admin-sidebar-navigation-screen__title"
						color={ '#e0e0e0' /* $gray-200 */ }
						level={ 1 }
						size={ 20 }
					>
						{ title }
					</Heading>

					{ actions && (
						<div className="a8c-site-admin-sidebar-navigation-screen__actions">{ actions }</div>
					) }
				</HStack>
				{ meta && (
					<>
						<div className="a8c-site-admin-sidebar-navigation-screen__meta">{ meta }</div>
					</>
				) }

				<div className="a8c-site-admin-sidebar-navigation-screen__content">
					{ description && (
						<p className="a8c-site-admin-sidebar-navigation-screen__description">{ description }</p>
					) }
					{ content }
				</div>
			</VStack>

			{ footer && (
				<footer className="a8c-site-admin-sidebar-navigation-screen__footer">{ footer }</footer>
			) }
		</>
	);
}
