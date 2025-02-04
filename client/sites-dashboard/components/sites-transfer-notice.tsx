import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Spinner } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

const StatusIcon = styled( Gridicon )`
	width: 16px;
	height: 16px;
	margin: 5px 11px 0;
`;

const Container = styled.div( {
	display: 'flex',
	alignItems: 'center',
	marginLeft: '-10px',
} );

const NoticeText = styled.span( {
	overflow: 'hidden',
	whiteSpace: 'normal',
	textOverflow: 'ellipsis',
	fontSize: '12px',
	lineHeight: '20px',
} );

type SitesTransferNoticeProps = {
	isTransferring: boolean;
	hasError?: boolean;
};

export const SitesTransferNotice = ( {
	isTransferring = false,
	hasError = false,
}: SitesTransferNoticeProps ) => {
	const { __ } = useI18n();

	let icon;
	let text;
	let color;

	if ( hasError ) {
		icon = 'notice';
		text = __( 'An error occurred.' );
		color = 'red';
	} else {
		icon = 'checkmark';
		color = 'green';
		text = isTransferring ? __( 'Activating site' ) : __( 'Activated!' );
	}

	return (
		<Container>
			<span>
				{ isTransferring ? <Spinner /> : <StatusIcon color={ color } icon={ icon } size={ 18 } /> }
			</span>
			<NoticeText>{ text }</NoticeText>
		</Container>
	);
};
