import { html } from '../../panel/indices-to-html';
import { p } from '../../panel/templates/functions';

const PromptBlock = ( { block } ) => <div className="wpnc__prompt">{ p( html( block ) ) }</div>;

export default PromptBlock;
