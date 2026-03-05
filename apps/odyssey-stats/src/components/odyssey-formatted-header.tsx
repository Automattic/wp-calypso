import CalypsoFormattedHeader, {
	Props as FormattedHeaderProps,
} from 'calypso/components/formatted-header';

export default function FormattedHeader( { ...props }: FormattedHeaderProps ) {
	return <CalypsoFormattedHeader { ...props } />;
}
