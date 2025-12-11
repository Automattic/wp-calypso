import { isSupportUserSession } from '@automattic/calypso-support-session';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import Logo from './logo';
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
			<Logo />

			<HStack spacing={ 2 } justify="flex-end">
				<Button
					className="dashboard-secondary-menu__item"
					icon={ <ReaderIcon /> }
					label={ __( 'Reader' ) }
					text={ __( 'Reader' ) }
					href="/reader"
				/>
			</HStack>
		</HStack>
	);
};

export default ReaderHeader;
