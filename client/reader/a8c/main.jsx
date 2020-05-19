/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect, useDispatch } from 'react-redux';
import config from 'config';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import { Button } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { requestMarkAllAsSeen, requestMarkAllAsUnseen } from 'state/reader/seen-posts/actions';
import { SECTION_A8C_FOLLOWING } from 'state/reader/seen-posts/constants';
import { sectionHasUnseen } from 'state/reader/seen-posts/selectors';

const A8CFollowing = ( props ) => {
	const { translate } = props;
	const dispatch = useDispatch();

	const markAllAsSeen = () => {
		dispatch( requestMarkAllAsSeen( { section: SECTION_A8C_FOLLOWING } ) );
	};

	const markAllAsUnSeen = () => {
		dispatch( requestMarkAllAsUnseen( { section: SECTION_A8C_FOLLOWING } ) );
	};

	return (
		<Stream { ...props } shouldCombineCards={ false }>
			<SectionHeader label={ translate( 'Followed A8C Sites' ) }>
				{ config.isEnabled( 'reader/seen-posts' ) && ! props.hasUnseen && (
					<Button compact onClick={ markAllAsUnSeen }>
						{ translate( 'Mark All as unseen' ) }
					</Button>
				) }
				{ config.isEnabled( 'reader/seen-posts' ) && props.hasUnseen && (
					<Button compact onClick={ markAllAsSeen }>
						{ translate( 'Mark All as seen' ) }
					</Button>
				) }
			</SectionHeader>
		</Stream>
	);
};

export default connect( ( state ) => ( {
	hasUnseen: sectionHasUnseen( state, SECTION_A8C_FOLLOWING ),
} ) )( localize( A8CFollowing ) );
