import { isSupportUserSession } from '@automattic/calypso-support-session';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Logo from './logo';
import SecondaryMenu from './secondary-menu';

import './style.scss';

const ReaderHeader = () => {
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
				label={ __( 'Reader Home' ) }
				href="/reader"
			/>

			<HStack spacing={ 2 } justify="flex-end">
				<SecondaryMenu />
			</HStack>
		</HStack>
	);
};

export default ReaderHeader;
