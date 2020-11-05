import { Application } from 'stimulus'

import DialogController from './controllers/dialog_controller'

const application = Application.start()
application.register('dialog', DialogController)
