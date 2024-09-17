import clsx from 'clsx';
import AsyncLoad from 'calypso/components/async-load';

interface LayoutProps {
	sectionGroup: string;
	sectionName: string;
	primary: React.ReactNode;
	secondary: React.ReactNode;
}

export default function Layout( { sectionGroup, sectionName, primary, secondary }: LayoutProps ) {
	const sectionClass = clsx( 'layout', {
		[ 'is-group-' + sectionGroup ]: sectionGroup,
		[ 'is-section-' + sectionName ]: sectionName,
	} );

	return (
		<div className={ sectionClass }>
			<div id="content" className="layout__content">
				<AsyncLoad require="calypso/components/global-notices" placeholder={ null } id="notices" />
				<div id="secondary" className="layout__secondary" role="navigation">
					{ secondary }
				</div>
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
			</div>
		</div>
	);
}
