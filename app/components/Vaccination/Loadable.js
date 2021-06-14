/**
 *
 * Asynchronously loads the component for Vaccination
 *
 */

import loadable from 'utils/loadable';

export default loadable(() => import('./index'));
