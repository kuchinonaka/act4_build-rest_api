import express, { Request, Response } from "express";
import { UnitProduct, Product } from "./product.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./product.database";

export const productRouter = express.Router();

productRouter.get("/products", async (req: Request, res: Response): Promise<void> => {
    try {
        const allProducts: UnitProduct[] = await database.findAll();

        if (allProducts.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ msg: "No products at this time..." });
        } else {
            res.status(StatusCodes.OK).json({ total_product: allProducts.length, allProducts });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});

productRouter.get("/product/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const product: UnitProduct = await database.findOne(req.params.id);

        if (!product) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "Product not found:" });
        } else {
            res.status(StatusCodes.OK).json({ product });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});

productRouter.post("/product", async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price, quantity } = req.body;

        if (!name || !description || !price || quantity === undefined) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters..." });
            return;
        }

        const newProduct = await database.create(req.body);

        res.status(StatusCodes.CREATED).json({ newProduct });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});

// Keep the old route for backward compatibility
productRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price, quantity } = req.body;

        if (!name || !description || !price || quantity === undefined) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters..." });
            return;
        }

        const newProduct = await database.create(req.body);

        res.status(StatusCodes.CREATED).json({ newProduct });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});

productRouter.put("/product/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price, quantity } = req.body;

        const getProduct = await database.findOne(req.params.id);

        if (!name || !description || !price || quantity === undefined) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters..." });
            return;
        }

        if (!getProduct) {
            res.status(StatusCodes.NOT_FOUND).json({ error: `No product with id ${req.params.id}` });
            return;
        }

        const updatedProduct = await database.update(req.params.id, req.body);

        res.status(StatusCodes.OK).json({ updatedProduct });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});

productRouter.delete("/product/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;

        const product = await database.findOne(id);

        if (!product) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "Product does not exist" });
            return;
        }

        await database.remove(id);

        res.status(StatusCodes.OK).json({ msg: "Product deleted" });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});