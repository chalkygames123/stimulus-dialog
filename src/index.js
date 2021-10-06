import { Application } from '@hotwired/stimulus';

import { DialogController } from './controllers';

const application = Application.start();

application.register('dialog', DialogController);
