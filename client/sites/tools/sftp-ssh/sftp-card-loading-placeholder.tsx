import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';

const PlaceholderGroup = styled.div( {
	display: 'flex',
	flexDirection: 'column',
	gap: '0.5em',
} );

const ParagraphPlaceholder = styled( LoadingPlaceholder )( {
	maxWidth: '100%',
} );
const LinkPlaceholder = styled( ParagraphPlaceholder )( { width: 290, marginBottom: 30 } );
const LabelPlaceholder = styled( ParagraphPlaceholder )( { width: 50 } );
const InputPlaceholder = styled( ParagraphPlaceholder )( {
	width: '80%',
	height: 36,
	marginBottom: 20,
} );

export function SftpCardLoadingPlaceholder() {
	return (
		<PlaceholderGroup>
			<ParagraphPlaceholder />
			<LinkPlaceholder />
			{ [ 1, 2 ].map( ( i ) => (
				<PlaceholderGroup key={ i }>
					<LabelPlaceholder />
					<InputPlaceholder />
				</PlaceholderGroup>
			) ) }
			<LabelPlaceholder />
			<ParagraphPlaceholder />
			<LinkPlaceholder />
		</PlaceholderGroup>
	);
}
