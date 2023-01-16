import DocumentHead from 'calypso/components/data/document-head';
import './style.scss';

interface Props {
	title: string;
	description: string;
}

const NavigatorHeader = ( { title, description }: Props ) => {
	return (
		<>
			<DocumentHead title={ title } />
			<div className="pattern-assembler-navigator-header">
				<h2 className="pattern-assembler-navigator-header__title">{ title }</h2>
				{ description && (
					<p className="pattern-assembler-navigator-header__description">{ description }</p>
				) }
			</div>
		</>
	);
};

export default NavigatorHeader;
