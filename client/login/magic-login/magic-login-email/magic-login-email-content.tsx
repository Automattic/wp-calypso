interface MagicLoginEmailContentProps {
	name: string;
}

export function MagicLoginEmailContent( { name }: MagicLoginEmailContentProps ) {
	return <p>Open in { name }</p>;
}
