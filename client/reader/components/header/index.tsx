import { isSupportUserSession } from '@automattic/calypso-support-session';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import Logo from './logo';
import './style.scss';

const ReaderHeader = () => {
	const isDesktop = useViewportMatch( 'medium' );
	return (
		<HStack
			className={ clsx( 'dashboard-header-bar', {
				// Only customize header for support "user" sessions because
				// "next" sessions already have a floating toolbar which acts
				// as visual indicator.
				'is-support-user-session': isSupportUserSession(),
			} ) }
			alignment="left"
			spacing={ 0 }
			justify="flex-start"
		>
			<Button
				style={ { flexShrink: 0 } }
				icon={ <Logo /> }
				label={ __( 'WordPress.com Home' ) }
				href="/v2"
			/>
			<HStack spacing={ 0 } justify="flex-end">
				<Button
					className="dashboard-secondary-menu__item"
					icon={ <ReaderIcon /> }
					label={ __( 'Reader' ) }
					text={ isDesktop ? __( 'Reader' ) : undefined }
					href="/reader"
				/>
			</HStack>
		</HStack>
	);
};

export default ReaderHeader;
