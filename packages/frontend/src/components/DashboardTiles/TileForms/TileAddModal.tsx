import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogProps,
} from '@blueprintjs/core';
import {
    assertUnreachable,
    Dashboard,
    DashboardLoomTileProperties,
    DashboardMarkdownTileProperties,
    DashboardTileTypes,
    defaultTileSize,
} from '@lightdash/common';
import { useForm, UseFormReturnType } from '@mantine/form';
import { FC, useState } from 'react';
import { v4 as uuid4 } from 'uuid';
import ChartTileForm from './ChartTileForm';
import LoomTileForm, { getLoomId } from './LoomTileForm';
import MarkdownTileForm from './MarkdownTileForm';

type Tile = Dashboard['tiles'][number];
type TileProperties = Tile['properties'];

interface AddProps extends DialogProps {
    type?: DashboardTileTypes;
    onClose?: () => void;
    onConfirm: (tile: Tile) => void;
}

export const TileAddModal: FC<AddProps> = ({
    type,
    onClose,
    onConfirm,
    ...modalProps
}) => {
    const [errorMessage, setErrorMessage] = useState<string>();

    const getValidators = () => {
        const urlValidator = {
            url: (value: string | undefined) =>
                getLoomId(value) ? null : 'Loom url not valid',
        };
        const titleValidator = {
            title: (value: string | undefined) =>
                !value || !value.length ? 'Required field' : null,
        };
        if (type === DashboardTileTypes.LOOM)
            return { ...urlValidator, ...titleValidator };
    };

    const form = useForm<TileProperties>({
        validate: getValidators(),
        validateInputOnChange: ['title', 'url', 'content'],
    });

    if (!type) return null;

    const handleConfirm = form.onSubmit(({ ...properties }) => {
        if (type === DashboardTileTypes.MARKDOWN) {
            const markdownForm = properties as any;
            if (!markdownForm.title && !markdownForm.content) {
                setErrorMessage('Title or content is required');
                return;
            }
        }

        onConfirm({
            uuid: uuid4(),
            properties: properties as any,
            type,
            ...defaultTileSize,
        });
        form.reset();
        setErrorMessage('');
    });

    const handleClose = () => {
        form.reset();
        setErrorMessage('');
        onClose?.();
    };

    return (
        <Dialog
            lazy
            title="Add tile to dashboard"
            {...modalProps}
            onClose={handleClose}
        >
            <form onSubmit={handleConfirm}>
                <DialogBody>
                    {type === DashboardTileTypes.SAVED_CHART ? (
                        <ChartTileForm />
                    ) : type === DashboardTileTypes.MARKDOWN ? (
                        <MarkdownTileForm
                            form={
                                form as UseFormReturnType<
                                    DashboardMarkdownTileProperties['properties']
                                >
                            }
                        />
                    ) : type === DashboardTileTypes.LOOM ? (
                        <LoomTileForm
                            form={
                                form as UseFormReturnType<
                                    DashboardLoomTileProperties['properties']
                                >
                            }
                            withHideTitle={false}
                        />
                    ) : (
                        assertUnreachable(type, 'Tile type not supported')
                    )}
                </DialogBody>

                <DialogFooter
                    actions={
                        <>
                            {errorMessage}

                            <Button onClick={handleClose}>Cancel</Button>

                            <Button
                                intent="primary"
                                type="submit"
                                disabled={!form.isValid()}
                            >
                                Add
                            </Button>
                        </>
                    }
                />
            </form>
        </Dialog>
    );
};
