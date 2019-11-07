/**
 * External dependencies
 */
import React from 'react';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { CheckIcon, ErrorIcon, InfoIcon } from './shared-icons';

export default function Notice( { className, type, children } ) {
	return (
		<NoticeWrapper className={ joinClasses( [ className, 'notice' ] ) }>
			<NoticeIconWrapper type={ type } className={ joinClasses( [ className, 'notice' ] ) }>
				<NoticeIcon type={ type } />
			</NoticeIconWrapper>
			<NoticeContent className={ joinClasses( [ className, 'notice__content' ] ) }>
				{ children }
			</NoticeContent>
		</NoticeWrapper>
	);
}

Notice.propTypes = {
	type: PropTypes.string,
};

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const NoticeWrapper = styled.div`
	position: fixed;
	top: 10px;
	right: 10px;
	color: ${props => props.theme.colors.textColorOnDarkBackground};
	display: flex;
	align-items: center;
	animation: ${fadeIn} 0.3s ease-in;
	background: ${props => props.theme.colors.noticeBackground};
	border-radius: 3px;
`;

const NoticeIconWrapper = styled.div`
	background: ${getNoticeBackground};
	padding: 14px;
	border-radius: 3px 0 0 3px;

	svg {
		display: block;
		width: 24px;
		height: 24px;
	}
`;

const NoticeContent = styled.div`
	padding: 14px;
	font-size: ${props => props.theme.fontSize.small};
`;

function getNoticeBackground( { theme, type } ) {
	const { colors } = theme;

	switch ( type ) {
		case 'success':
			return colors.success;
		case 'error':
			return colors.error;
		default:
			return colors.defaultNoticeIconBackground;
	}
}

function NoticeIcon( { type } ) {
	switch ( type ) {
		case 'success':
			return <CheckIcon />;
		case 'error':
			return <ErrorIcon />;
		default:
			return <InfoIcon />;
	}
}
