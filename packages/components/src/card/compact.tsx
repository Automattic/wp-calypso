import Card from '.';
import type { Props, TagName } from '.';

export default function CompactCard< T extends TagName = 'div' >(
	props: Omit< Props< T >, 'compact' >
): JSX.Element {
	return <Card { ...( props as Props< T > ) } compact />;
}
