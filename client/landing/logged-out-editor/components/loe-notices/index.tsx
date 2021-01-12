/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { SnackbarList } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './styles.scss';

const Notices: FC = () => {
	const notices = useSelect(
		( select ) =>
			select( 'core/notices' )
				.getNotices()
				.filter( ( notice ) => notice.type === 'snackbar' ),
		[]
	);
	const { removeNotice } = useDispatch( 'core/notices' );
	return <SnackbarList className="loe-notices" notices={ notices } onRemove={ removeNotice } />;
};

export default Notices;
