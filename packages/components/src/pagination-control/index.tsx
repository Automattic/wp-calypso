import { __, sprintf } from '@wordpress/i18n';
import classnames from 'classnames';
import { times } from 'lodash';
import './style.scss';

interface Props {
	onChange: ( page: number ) => void;
	activePageIndex: number;
	numberOfPages: number;
	classNames?: string | string[];
}

const PaginationControl: React.FunctionComponent< Props > = ( props ) => {
	const { activePageIndex, numberOfPages, onChange, classNames, children } = props;

	const classes = classnames( 'pagination-control', classNames );

	return (
		<ul className={ classes } aria-label={ __( 'Pagination control' ) }>
			{ times( numberOfPages, ( index ) => (
				<li
					key={ `${ numberOfPages }-${ index }` }
					aria-current={ index === activePageIndex ? 'page' : undefined }
				>
					<button
						className={ classnames( 'pagination-control__page', {
							'pagination-control__current': index === activePageIndex,
						} ) }
						disabled={ index === activePageIndex }
						aria-label={ sprintf(
							/* translators: 1: current page number 2: total number of pages */
							__( 'Page %1$d of %2$d' ),
							index + 1,
							numberOfPages
						) }
						onClick={ () => onChange( index ) }
					/>
				</li>
			) ) }
			{ children && <li className="pagination-control__last-item">{ children }</li> }
		</ul>
	);
};

export default PaginationControl;
