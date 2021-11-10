import { configureStore } from "@reduxjs/toolkit";
import contactsReducer from "./slices/contacts/contactsSlice"

export const store = configureStore({
  reducer: {
    contacts: contactsReducer
  },
});